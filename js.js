(function () {
    var app = angular.module("betApp", []);

    app.controller("X10Controller", ['$scope', '$timeout', function ($scope, $timeout) {
        {
            $scope.btcBase = '0.00000001';
            $scope.btcForBet = $scope.btcBase;
            $scope.test = 1;
            $scope.payout = 10;
            $scope.betSpeed = 500;
            $scope.betSpeedAuto = true;
            $scope.pauseOnWin = false;
            $scope.betProbe = 4;
            $scope.btcPlus = '0.00000015';
            $scope.betMode = 1;
            $scope.increaseBet = 1.12;
            $scope.percentIncrease = 40;
            $scope.increaseWhenLost = 3;
            $scope.pauseOnLoss = 2;
            $scope.btcLimitBet = '0.00002000';
            $scope.btcBefore = $('#balance').text();
            $scope.btcAfter = $scope.btcBefore;
            $scope.btcIncrement = (($scope.btcAfter * 1).toFixed(8) - ($scope.btcBefore * 1).toFixed(8)).toFixed(8);
            $scope.testVal = '';
            $scope.onBetting = false;
            $scope.betHiFlg = true;
            $scope.onMaxBet = 1;
            $scope.onBtcMaxBet = $scope.btcBase;
            $scope.winFlg = false;
            $scope.betCount = 0;

            $scope.lossIndex = 0;
            var i;

            var numbers = [];
            var btcBases = [];
            for (i = 1; i <= 20; i++) {
                numbers.push({
                    value: i
                });
                btcBases.push({
                    value: (i / 100000000).toFixed(8)
                });
            }
            $scope.btcBases = btcBases;
            $scope.payouts = numbers;
            $scope.increaseWhenLosts = numbers;

            var betProbes = [];
            for (i = 1; i <= 100; i++) {
                betProbes.push({
                    value: i
                });
            }
            $scope.betProbes = betProbes;

            var percentIncreases = [];
            var btcPlusList = [];
            for (i = 1; i <= 200; i++) {
                percentIncreases.push({
                    value: i
                });
                btcPlusList.push({
                    value: (i / 100000000).toFixed(8)
                });
            }
            $scope.percentIncreases = percentIncreases;
            $scope.btcPlusList = btcPlusList;

            $scope.betSpeeds = [{
                name: 'Cực nhanh',
                value: 10
            }, {
                name: 'nhanh',
                value: 100
            }, {
                name: 'Bình thường',
                value: 500
            }, {
                name: 'chậm',
                value: 1000
            }, {
                name: 'Cực chậm',
                value: 2000
            }];

            $scope.betModes = [{
                name: 'Alternate',
                value: 1
            }, {
                name: 'Random',
                value: 2
            }, {
                name: 'HI',
                value: 3
            }, {
                name: 'LO',
                value: 4
            }];

            $scope.increaseBets = [{
                name: '5',
                value: 1.05
            }, {
                name: '12',
                value: 1.12
            }, {
                name: '20',
                value: 1.2
            }, {
                name: '50',
                value: 1.5
            }, {
                name: '100',
                value: 2
            }];

            getOnBetList();
            $scope.changeSetting = function () {
                getOnBetList();
            };

            $scope.startBet = function () {
                $scope.onBetting = true;
                returnBetButton();
            };
            $scope.pauseBet = function () {
                $scope.onBetting = false;
                returnBetButton();
            };

            $('#balance').bind('DOMSubtreeModified', function (e) {
                if ($(e.currentTarget).is(':contains(".")') && $scope.onBetting) {
                    returnBetSpeedAutoPlay();
                    $timeout(function () {
                        $scope.betCount++;
                        var btcOld = $scope.btcAfter;
                        $scope.btcAfter = $('#balance').text();
                        $scope.btcIncrement = (($scope.btcAfter * 1).toFixed(8) - ($scope.btcBefore * 1).toFixed(8)).toFixed(8);

                        var index = $scope.lossIndex;
                        if($scope.onBetting) {
                            $scope.boyBetStyle = {
                                'overflow': 'hidden'
                            };
                        } else {
                            $scope.boyBetStyle = {};
                        }
                        
                        if (btcOld < $scope.btcAfter || $scope.btcLimitBet < $scope.btcForBet) {
                            getOnBetList();
                            $scope.lossIndex = 1;
                            $scope.winFlg = true;
                            if ($scope.pauseOnWin) {
                                $scope.onBetting = false;
                            }
                            $scope.btcForBet = $scope.btcBase;
                            document.getElementById('line1').scrollIntoView(true);
                            returnBetButton();
                        } else {
                            $scope.onMaxBet = $scope.lossIndex > $scope.onMaxBet ? $scope.lossIndex : $scope.onMaxBet;
                            $scope.onBtcMaxBet = $scope.btcForBet > $scope.onBtcMaxBet ? $scope.btcForBet : $scope.onBtcMaxBet;
                            $scope.btcForBet = returnCurrentBtcBet($scope.lossIndex, $scope.btcForBet);
                            document.getElementById('line' + ($scope.lossIndex)).scrollIntoView(true);
                            returnBetButton();
                        }
                        $scope.winFlg = Math.random() >= .6;
                        if($scope.winFlg) {
                            $scope.lossIndex = 1;
                        }
                        console.log($scope.winFlg);
                    }, 200);
                    // $scope.$apply();
                }
            });

            function getOnBetList() {
                $scope.btcForBet = $scope.btcBase;
                var currentIndex = 1;
                var currentBtcBet = $scope.btcBase;
                var currentBtcWin;
                var currentBtcLost = 0;
                var currentBtcRemain = $scope.btcAfter;
                $scope.lossIndex = 0;
                $scope.onBetList = [];

                do {
                    currentBtcBet = returnCurrentBtcBet(currentIndex - 1, currentBtcBet);

                    currentBtcLost = (currentBtcLost * 1 + currentBtcBet * 1).toFixed(8);
                    currentBtcWin = (currentBtcBet * ($scope.payout - 1) - currentBtcLost).toFixed(8);
                    currentBtcRemain = (currentBtcRemain - currentBtcBet).toFixed(8);

                    var betItem = {
                        index: currentIndex,
                        btcBet: currentBtcBet,
                        btcWin: currentBtcWin
                    };

                    $scope.onBetList.push(betItem);
                    currentIndex++;

                } while (currentBtcBet < currentBtcRemain || currentIndex >= 100);
                $scope.currentMaxBet = $scope.onBetList.slice(-1)[0];
                $scope.btcLimitPercent = (($scope.btcLimitBet / $scope.btcAfter) * 100).toFixed(1);
            }

            function returnBetButton() {
                $scope.lossIndex++;
                $scope.clickBtn;
                if (!$scope.onBetting) {
                    return;
                }
                switch ($scope.betMode) {
                    case 1:
                        $scope.betHiFlg = !$scope.betHiFlg;
                        break;
                    case 2:
                        var random_boolean = Math.random() >= 0.5;
                        $scope.betHiFlg = random_boolean;
                        break;
                    case 3:
                        $scope.betHiFlg = true;
                        break;
                    case 4:
                        $scope.betHiFlg = false;
                        break;
                }
                if ($scope.betHiFlg) {
                    $scope.clickBtn = 'hi';
                } else {
                    $scope.clickBtn = 'lo';
                }
                if ($scope.onBetting) {
                    setTimeout(function () {
                        $('#double_your_btc_bet_' + $scope.clickBtn + '_button').trigger('click');
                    }, $scope.betSpeed);
                }
            }

            function returnPercent(percent) {
                return 1 + (percent / 100);
            }

            function returnCurrentBtcBet(betIndex, previousBtcBet) {
                var currentBtcBet = previousBtcBet;
                if (betIndex > $scope.betProbe && betIndex % $scope.increaseWhenLost == $scope.betProbe % $scope.increaseWhenLost) {
                    currentBtcBet = (previousBtcBet * returnPercent($scope.percentIncrease)).toFixed(8);
                }
                return betIndex == $scope.betProbe ? ($scope.btcPlus * 1).toFixed(8) : currentBtcBet;
            }

            function returnBetSpeedAutoPlay() {
                if ($scope.betSpeedAuto) {
                    var currentMaxBet = $scope.currentMaxBet.index;
                    if ($scope.lossIndex <= $scope.betProbe) {
                        $scope.betSpeed = $scope.betSpeeds[0].value;
                    } else if ($scope.lossIndex <= (currentMaxBet - $scope.betProbe) / 3 + $scope.betProbe) {
                        $scope.betSpeed = $scope.betSpeeds[1].value;
                    } else if ($scope.lossIndex <= (currentMaxBet - $scope.betProbe) / 2 + $scope.betProbe) {
                        $scope.betSpeed = $scope.betSpeeds[2].value;
                    } else if ($scope.lossIndex <= (currentMaxBet - $scope.betProbe) / 1.5 + $scope.betProbe) {
                        $scope.betSpeed = $scope.betSpeeds[3].value;
                    } else {
                        $scope.betSpeed = $scope.betSpeeds[4].value;
                    }
                }
            }

            $scope.requestBet = function () {
                var random_boolean = Math.random() >= 0.5;
                $scope.btcAfter = random_boolean? ($scope.btcAfter * 1 - $scope.btcPlus * 1).toFixed(8):($scope.btcAfter * 1 + $scope.btcPlus * 1).toFixed(8);
                $('#balance').text($scope.btcAfter);
            };
        }
    }]);
})();